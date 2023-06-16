import { useState } from 'react';
import { v4 } from 'uuid';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import {
  CommentableType,
  QueryMode,
  SortOrder,
  useAddCommentThreadTargetOnCommentThreadMutation,
  useRemoveCommentThreadTargetOnCommentThreadMutation,
  useSearchCompanyQueryQuery,
} from '~/generated/graphql';

import { CommentThreadEntityRelationPicker } from './CommentThreadEntityRelationPicker';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

export function CommentThreadRelationPickerCompany({
  commentThread,
}: OwnProps) {
  const [searchFilter, setSearchFilter] = useState('');

  const companyIds = commentThread.commentThreadTargets
    ?.filter((relation) => relation.commentableType === 'Company')
    .map((relation) => relation.commentableId);

  const { data: selectedCompaniesData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        id: {
          in: companyIds,
        },
      },
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  const { data: filteredSelectedCompaniesData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        AND: [
          {
            name: {
              contains: `%${searchFilter}%`,
              mode: QueryMode.Insensitive,
            },
          },
          {
            id: {
              in: companyIds,
            },
          },
        ],
      },
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  const { data: companiesToSelectData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        AND: [
          {
            name: {
              contains: `%${searchFilter}%`,
              mode: QueryMode.Insensitive,
            },
          },
          {
            id: {
              notIn: companyIds,
            },
          },
        ],
      },
      limit: 10,
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  function handleFilterChange(newSearchFilter: string) {
    setSearchFilter(newSearchFilter);
  }

  const [addCommentThreadTargetOnCommentThread] =
    useAddCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies'],
    });

  const [removeCommentThreadTargetOnCommentThread] =
    useRemoveCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies'],
    });

  function handleCheckItemChange(newCheckedValue: boolean, companyId: string) {
    if (newCheckedValue) {
      addCommentThreadTargetOnCommentThread({
        variables: {
          commentableEntityId: companyId,
          commentableEntityType: CommentableType.Company,
          commentThreadId: commentThread.id,
          commentThreadTargetCreationDate: new Date().toISOString(),
          commentThreadTargetId: v4(),
        },
      });
    } else {
      const foundCorrespondingTarget = commentThread.commentThreadTargets?.find(
        (target) => target.commentableId === companyId,
      );

      if (foundCorrespondingTarget) {
        removeCommentThreadTargetOnCommentThread({
          variables: {
            commentThreadId: commentThread.id,
            commentThreadTargetId: foundCorrespondingTarget.id,
          },
        });
      }
    }
  }

  const selectedCompanies = selectedCompaniesData?.searchResults ?? [];

  const filteredSelectedCompanies =
    filteredSelectedCompaniesData?.searchResults ?? [];
  const companiesToSelect = companiesToSelectData?.searchResults ?? [];

  return (
    <CommentThreadEntityRelationPicker
      entitiesToSelect={companiesToSelect}
      filteredSelectedEntities={filteredSelectedCompanies}
      selectedEntities={selectedCompanies}
      onItemCheckChange={handleCheckItemChange}
      onSearchFilterChange={handleFilterChange}
    />
  );
}

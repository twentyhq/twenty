import { useState } from 'react';
import { v4 } from 'uuid';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import { useFilteredSearchEntityQuery } from '@/ui/hooks/menu/useFilteredSearchEntityQuery';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  useAddCommentThreadTargetOnCommentThreadMutation,
  useRemoveCommentThreadTargetOnCommentThreadMutation,
  useSearchCompanyQueryQuery,
  useSearchPeopleQueryQuery,
} from '~/generated/graphql';

import { EntityForSelect, MultipleEntitySelect } from './MultipleEntitySelect';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const [searchFilter, setSearchFilter] = useState('');

  const peopleIds =
    commentThread.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Person')
      .map((relation) => relation.commentableId) ?? [];

  const companyIds =
    commentThread.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Company')
      .map((relation) => relation.commentableId) ?? [];

  const personsForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQueryQuery,
    searchOnFields: ['firstname', 'lastname'],
    orderByField: 'lastname',
    selectedIds: peopleIds,
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: CommentableType.Person,
      name: `${entity.firstname} ${entity.lastname}`,
      avatarUrl: '',
    }),
    searchFilter,
  });

  const companiesForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQueryQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: companyIds,
    mappingFunction: (company) => ({
      id: company.id,
      entityType: CommentableType.Company,
      name: company.name,
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    searchFilter,
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

  function handleCheckItemChange(
    newCheckedValue: boolean,
    entity: EntityForSelect,
  ) {
    if (newCheckedValue) {
      addCommentThreadTargetOnCommentThread({
        variables: {
          commentableEntityId: entity.id,
          commentableEntityType: entity.entityType,
          commentThreadId: commentThread.id,
          commentThreadTargetCreationDate: new Date().toISOString(),
          commentThreadTargetId: v4(),
        },
      });
    } else {
      const foundCorrespondingTarget = commentThread.commentThreadTargets?.find(
        (target) => target.commentableId === entity.id,
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

  return (
    <MultipleEntitySelect
      entities={[personsForMultiSelect, companiesForMultiSelect]}
      onItemCheckChange={handleCheckItemChange}
      onSearchFilterChange={handleFilterChange}
    />
  );
}

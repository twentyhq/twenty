import { useEffect, useState } from 'react';

import { CellCommentChip } from '@/comments/components/table/CellCommentChip';
import { useOpenTimelineRightDrawer } from '@/comments/hooks/useOpenTimelineRightDrawer';
import { EditableCellChip } from '@/ui/components/editable-cell/types/EditableChip';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  GetCompaniesQuery,
  useUpdateCompanyMutation,
} from '~/generated/graphql';

import { CompanyChip } from './CompanyChip';

type OwnProps = {
  company: Pick<
    GetCompaniesQuery['companies'][0],
    'id' | 'name' | 'domainName' | '_commentThreadCount'
  >;
};

export function CompanyEditableNameChipCell({ company }: OwnProps) {
  const openCommentRightDrawer = useOpenTimelineRightDrawer();
  const [updateCompany] = useUpdateCompanyMutation();

  const [internalValue, setInternalValue] = useState(company.name ?? '');

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    openCommentRightDrawer([
      {
        type: CommentableType.Company,
        id: company.id,
      },
    ]);
  }

  useEffect(() => {
    setInternalValue(company.name ?? '');
  }, [company.name]);

  return (
    <EditableCellChip
      value={internalValue}
      placeholder="Name"
      picture={getLogoUrlFromDomainName(company.domainName)}
      id={company.id}
      changeHandler={setInternalValue}
      ChipComponent={CompanyChip}
      rightEndContents={[
        <CellCommentChip
          count={company._commentThreadCount ?? 0}
          onClick={handleCommentClick}
        />,
      ]}
      onSubmit={() =>
        updateCompany({
          variables: {
            id: company.id,
            name: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(company.name ?? '')}
    />
  );
}

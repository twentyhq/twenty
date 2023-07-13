import { useRef, useState } from 'react';

import { CellCommentChip } from '@/comments/components/table/CellCommentChip';
import { useOpenTimelineRightDrawer } from '@/comments/hooks/useOpenTimelineRightDrawer';
import { useCurrentCellEditMode } from '@/ui/components/editable-cell/hooks/useCurrentCellEditMode';
import { useRegisterLeaveCellHandlers } from '@/ui/components/editable-cell/hooks/useRegisterLeaveCellHandlers';
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
  const [internalValue, setInternalValue] = useState(company.name ?? '');

  const openCommentRightDrawer = useOpenTimelineRightDrawer();
  const [updateCompany] = useUpdateCompanyMutation();
  const cellRef = useRef(null);
  useRegisterLeaveCellHandlers(cellRef, () =>
    updateCompany({
      variables: {
        id: company.id,
        name: internalValue,
      },
    }),
  );

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

  return (
    <div ref={cellRef}>
      <EditableCellChip
        value={company.name ?? ''}
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
      />
    </div>
  );
}

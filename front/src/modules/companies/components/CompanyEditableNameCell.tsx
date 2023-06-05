import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import EditableChip from '@/ui/components/editable-cell/types/EditableChip';
import { getLogoUrlFromDomainName } from '@/utils/utils';

import { CellCommentChip } from '../../comments/components/comments/CellCommentChip';
import { Company } from '../interfaces/company.interface';
import { updateCompany } from '../services';

import CompanyChip from './CompanyChip';

type OwnProps = {
  company: Company;
};

export function CompanyEditableNameChipCell({ company }: OwnProps) {
  const openCommentRightDrawer = useOpenCommentRightDrawer();

  function handleCommentClick() {
    openCommentRightDrawer([
      {
        type: 'Company',
        id: company.id,
      },
    ]);
  }

  return (
    <EditableChip
      value={company.name || ''}
      placeholder="Name"
      picture={getLogoUrlFromDomainName(company.domainName)}
      changeHandler={(value: string) => {
        updateCompany({
          ...company,
          name: value,
        });
      }}
      ChipComponent={CompanyChip}
      rightEndContents={[
        <CellCommentChip count={12} onClick={handleCommentClick} />,
      ]}
    />
  );
}

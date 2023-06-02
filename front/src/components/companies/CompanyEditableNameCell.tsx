import { Company } from '../../interfaces/entities/company.interface';
import { useOpenCommentRightDrawer } from '../../modules/comments/hooks/useOpenCommentRightDrawer';
import { updateCompany } from '../../services/api/companies';
import { getLogoUrlFromDomainName } from '../../services/utils';
import CompanyChip from '../chips/CompanyChip';
import EditableChip from '../editable-cell/EditableChip';

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
      commentCount={12}
      onCommentClick={handleCommentClick}
    />
  );
}

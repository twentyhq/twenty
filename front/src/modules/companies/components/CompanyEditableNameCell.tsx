import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import EditableChip from '@/ui/components/editable-cell/types/EditableChip';
import { getLogoUrlFromDomainName } from '@/utils/utils';

import { CellCommentChip } from '../../comments/components/comments/CellCommentChip';
import { useCompanyCommentsCountQuery } from '../../comments/services';
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

  const commentCount = useCompanyCommentsCountQuery(company.id);

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
        commentCount.loading ? null : (
          <CellCommentChip
            count={commentCount.data || 0}
            onClick={handleCommentClick}
          />
        ),
      ]}
    />
  );
}

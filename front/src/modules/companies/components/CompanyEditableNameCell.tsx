import { CellCommentChip } from '@/comments/components/comments/CellCommentChip';
import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import { useCompanyCommentsCountQuery } from '@/comments/services';
import EditableChip from '@/ui/components/editable-cell/types/EditableChip';
import { getLogoUrlFromDomainName } from '@/utils/utils';

import { Company } from '../interfaces/company.interface';
import { updateCompany } from '../services';

import CompanyChip from './CompanyChip';

type OwnProps = {
  company: Company;
};

export function CompanyEditableNameChipCell({ company }: OwnProps) {
  const openCommentRightDrawer = useOpenCommentRightDrawer();

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    openCommentRightDrawer([
      {
        type: 'Company',
        id: company.id,
      },
    ]);
  }

  const commentCount = useCompanyCommentsCountQuery(company.id);

  const displayCommentCount = !commentCount.loading;

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
        displayCommentCount && (
          <CellCommentChip
            count={commentCount.data ?? 0}
            onClick={handleCommentClick}
          />
        ),
      ]}
    />
  );
}

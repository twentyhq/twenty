import { CellCommentChip } from '@/comments/components/CellCommentChip';
import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import { EditableChipCell } from '@/ui/components/editable-cell/types/EditableChipCell';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  GetCompaniesQuery,
  useUpdateCompanyMutation,
} from '~/generated/graphql';

import CompanyChip from './CompanyChip';

type OwnProps = {
  company: Pick<
    GetCompaniesQuery['companies'][0],
    'id' | 'name' | 'domainName' | '_commentCount' | 'accountOwner'
  >;
};

export function CompanyEditableNameChipCell({ company }: OwnProps) {
  const openCommentRightDrawer = useOpenCommentRightDrawer();
  const [updateCompany] = useUpdateCompanyMutation();

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
    <EditableChipCell
      value={company.name || ''}
      placeholder="Name"
      picture={getLogoUrlFromDomainName(company.domainName)}
      changeHandler={(value: string) => {
        updateCompany({
          variables: {
            ...company,
            name: value,
            accountOwnerId: company.accountOwner?.id,
          },
        });
      }}
      ChipComponent={CompanyChip}
      rightEndContents={[
        <CellCommentChip
          count={company._commentCount ?? 0}
          onClick={handleCommentClick}
        />,
      ]}
    />
  );
}

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
    <EditableCellChip
      value={company.name || ''}
      placeholder="Name"
      picture={getLogoUrlFromDomainName(company.domainName)}
      id={company.id}
      changeHandler={(value: string) => {
        updateCompany({
          variables: {
            id: company.id,
            name: value,
          },
        });
      }}
      ChipComponent={CompanyChip}
      rightEndContents={[
        <CellCommentChip
          count={company._commentThreadCount ?? 0}
          onClick={handleCommentClick}
        />,
      ]}
    />
  );
}

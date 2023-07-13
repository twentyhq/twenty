import { useRecoilValue } from 'recoil';

import { CompanyEditableNameChipCell } from '@/companies/components/CompanyEditableNameCell';
import { companyCommentCountFamilyState } from '@/companies/states/companyCommentCountFamilyState';
import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { companyNameFamilyState } from '@/companies/states/companyNameFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyNameCell() {
  console.log('EditableCompanyNameCell');
  const currentRowEntityId = useCurrentRowEntityId();

  console.log({ currentRowEntityId });

  const [updateCompany] = useUpdateCompanyMutation();

  const name = useRecoilValue(companyNameFamilyState(currentRowEntityId ?? ''));

  console.log({ name });
  const domainName = useRecoilValue(
    companyDomainNameFamilyState(currentRowEntityId ?? ''),
  );

  const commentCount = useRecoilValue(
    companyCommentCountFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <CompanyEditableNameChipCell
      company={{
        id: currentRowEntityId ?? '',
        name: name ?? '',
        domainName: domainName ?? '',
        _commentThreadCount: commentCount ?? 0,
      }}
    />
  );
}

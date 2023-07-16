import { useRecoilValue } from 'recoil';

import { CompanyEditableNameChipCell } from '@/companies/components/CompanyEditableNameCell';
import { companyCommentCountFamilyState } from '@/companies/states/companyCommentCountFamilyState';
import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { companyNameFamilyState } from '@/companies/states/companyNameFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

export function EditableCompanyNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const name = useRecoilValue(companyNameFamilyState(currentRowEntityId ?? ''));

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

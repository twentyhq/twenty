import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { EditableCellURL } from '../../../ui/table/editable-cell/types/EditableCellURL';

export function EditableCompanyDomainNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateOneCompanyMutation();

  const domainName = useRecoilValue(
    companyDomainNameFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellURL
      url={domainName ?? ''}
      onSubmit={(newURL) =>
        updateCompany({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              domainName: newURL,
            },
          },
        })
      }
    />
  );
}

import { useRecoilValue } from 'recoil';

import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { EditableCellURL } from '../../../ui/table/editable-cell/types/EditableCellURL';
import { companyLinkedinUrlFamilyState } from '../../states/companyLinkedinUrlFamilyState';

export function EditableCompanyLinkedinUrlCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateOneCompanyMutation();

  const linkedinUrl = useRecoilValue(
    companyLinkedinUrlFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellURL
      url={linkedinUrl || ''}
      onSubmit={(newUrl) =>
        updateCompany({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              linkedinUrl: newUrl,
            },
          },
        })
      }
    />
  );
}

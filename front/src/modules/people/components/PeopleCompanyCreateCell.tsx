import { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { v4 } from 'uuid';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { DoubleTextInput } from '@/ui/components/inputs/DoubleTextInput';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { logError } from '@/utils/logs/logError';
import {
  Person,
  useInsertCompanyMutation,
  useUpdatePeopleMutation,
} from '~/generated/graphql';

type OwnProps = {
  people: Pick<Person, 'id'>;
};

export function PeopleCompanyCreateCell({ people }: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [currentSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const [companyName, setCompanyName] = useState(currentSearchFilter);

  const [companyDomainName, setCompanyDomainName] = useState('');
  const [insertCompany] = useInsertCompanyMutation();
  const [updatePeople] = useUpdatePeopleMutation();

  const containerRef = useRef(null);

  function handleDoubleTextChange(leftValue: string, rightValue: string): void {
    setCompanyDomainName(leftValue);
    setCompanyName(rightValue);
  }

  async function handleCompanyCreate(
    companyName: string,
    companyDomainName: string,
  ) {
    const newCompanyId = v4();

    try {
      await insertCompany({
        variables: {
          id: newCompanyId,
          name: companyName,
          domainName: companyDomainName,
          address: '',
          createdAt: new Date().toISOString(),
        },
      });

      await updatePeople({
        variables: {
          ...people,
          companyId: newCompanyId,
        },
      });
    } catch (error) {
      // TODO: handle error better
      logError(error);
    }

    setIsCreating(false);
  }

  useHotkeys(
    'enter, escape',
    () => {
      handleCompanyCreate(companyName, companyDomainName);
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true,
      preventDefault: true,
    },
    [companyName, companyDomainName, handleCompanyCreate],
  );

  useListenClickOutsideArrayOfRef([containerRef], () => {
    handleCompanyCreate(companyName, companyDomainName);
  });

  return (
    <DoubleTextInput
      leftValue={companyDomainName}
      rightValue={companyName}
      leftValuePlaceholder="URL"
      rightValuePlaceholder="Name"
      onChange={handleDoubleTextChange}
    />
  );
}

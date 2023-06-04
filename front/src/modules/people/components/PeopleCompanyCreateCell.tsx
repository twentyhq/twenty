import { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { DoubleTextInput } from '@/ui/components/inputs/DoubleTextInput';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';

type OwnProps = {
  initialCompanyName: string;
  onCreate: (companyName: string, companyDomainName: string) => void;
};

export function PeopleCompanyCreateCell({
  initialCompanyName,
  onCreate,
}: OwnProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [companyDomainName, setCompanyDomainName] = useState('');

  const containerRef = useRef(null);

  useListenClickOutsideArrayOfRef([containerRef], () => {
    onCreate(companyName, companyDomainName);
  });

  useHotkeys(
    'enter, escape',
    () => {
      onCreate(companyName, companyDomainName);
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true,
      preventDefault: true,
    },
    [containerRef, companyName, companyDomainName, onCreate],
  );

  function handleDoubleTextChange(leftValue: string, rightValue: string): void {
    setCompanyDomainName(leftValue);
    setCompanyName(rightValue);
  }

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

import { useRef, useState } from 'react';
import { DoubleTextInput } from '../inputs/DoubleTextInput';
import { useListenClickOutsideArrayOfRef } from '../../modules/ui/hooks/useListenClickOutsideArrayOfRef';
import { useHotkeys } from 'react-hotkeys-hook';
import { CellBaseContainer } from '../editable-cell/CellBaseContainer';
import { CellEditModeContainer } from '../editable-cell/CellEditModeContainer';

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
    <CellBaseContainer ref={containerRef}>
      <CellEditModeContainer editModeVerticalPosition="over">
        <DoubleTextInput
          leftValue={companyDomainName}
          rightValue={companyName}
          leftValuePlaceholder="URL"
          rightValuePlaceholder="Name"
          onChange={handleDoubleTextChange}
        />
      </CellEditModeContainer>
    </CellBaseContainer>
  );
}

import { useContext } from 'react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../contexts/FieldContext';
import { RelationFieldInput } from '../input/components/RelationFieldInput';
import { TextFieldInput } from '../input/components/TextFieldInput';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';

type OwnProps = {
  onSubmit?: () => void;
  onCancel?: () => void;
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
};

export const GenericFieldInput = ({
  onCancel,
  onSubmit,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onClickOutside,
}: OwnProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <>
      {isFieldRelation(fieldDefinition) ? (
        <RecoilScope>
          <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
        </RecoilScope>
      ) : isFieldText(fieldDefinition) ? (
        <TextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onShiftTab={onShiftTab}
          onTab={onTab}
        />
      ) : (
        <></>
      )}
    </>
  );
};

import { MultipleObjectPickerOnClickOutsideEffect } from '@/object-record/multiple-objects/multiple-objects-picker/components/MultipleObjectPickerOnClickOutsideEffect';
import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { MultipleRecordPicker } from '@/object-record/record-picker/components/MultipleRecordPicker';
import { useRef } from 'react';

type MultipleObjectsPickerProps = {
  componentInstanceId: string;
  onClickOutside: () => void;
  onSubmit: () => void;
  onChange: (recordId: string) => void;
};

export const MultipleObjectsPicker = ({
  componentInstanceId,
  onClickOutside,
  onSubmit,
  onChange,
}: MultipleObjectsPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <MultipleObjectsPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <MultipleObjectPickerOnClickOutsideEffect
        containerRef={containerRef}
        onClickOutside={onClickOutside}
      />
      <div ref={containerRef}>
        <MultipleRecordPicker
          onSubmit={onSubmit}
          onChange={onChange}
          componentInstanceId={componentInstanceId}
        />
      </div>
    </MultipleObjectsPickerComponentInstanceContext.Provider>
  );
};

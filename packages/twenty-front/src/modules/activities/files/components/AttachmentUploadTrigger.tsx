import { AttachmentFileInput } from '@/activities/files/components/AttachmentFileInput';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type ReactNode, useRef } from 'react';

type AttachmentUploadTriggerProps = {
  targetableObject: ActivityTargetableObject;
  children: (params: { openFilePicker: () => void }) => ReactNode;
};

// Owns the hidden file input, so the input is mounted exactly as long as a
// trigger that can open it.
export const AttachmentUploadTrigger = ({
  targetableObject,
  children,
}: AttachmentUploadTriggerProps) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    inputFileRef.current?.click();
  };

  return (
    <>
      <AttachmentFileInput
        ref={inputFileRef}
        targetableObject={targetableObject}
      />
      {children({ openFilePicker })}
    </>
  );
};

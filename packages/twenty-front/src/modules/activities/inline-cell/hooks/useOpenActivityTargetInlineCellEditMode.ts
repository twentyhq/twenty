type OpenActivityTargetInlineCellEditModeProps = {
  recordPickerInstanceId: string;
};

export const useOpenActivityTargetInlineCellEditMode = () => {
  const openActivityTargetInlineCellEditMode = ({
    recordPickerInstanceId,
  }: OpenActivityTargetInlineCellEditModeProps) => {
    // eslint-disable-next-line no-console
    console.log('openActivityTargetInlineCellEditMode', recordPickerInstanceId);
  };

  return { openActivityTargetInlineCellEditMode };
};

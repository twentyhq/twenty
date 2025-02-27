type OpenActivityTargetInlineCellEditModeProps = {
  componentInstanceId: string;
};

export const useOpenActivityTargetInlineCellEditMode = () => {
  const openActivityTargetInlineCellEditMode = ({
    componentInstanceId,
  }: OpenActivityTargetInlineCellEditModeProps) => {
    // eslint-disable-next-line no-console
    console.log('openActivityTargetInlineCellEditMode', componentInstanceId);
  };

  return { openActivityTargetInlineCellEditMode };
};

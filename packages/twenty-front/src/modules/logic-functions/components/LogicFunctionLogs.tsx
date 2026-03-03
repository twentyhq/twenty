import { InputLabel } from '@/ui/input/components/InputLabel';
import { useLingui } from '@lingui/react/macro';
import { ResizeHandle, useResizableEditor } from 'twenty-ui/input';
import { TextArea } from '@/ui/input/components/TextArea';

type LogicFunctionLogsProps = {
  componentInstanceId: string;
  value: string;
};

export const LogicFunctionLogs = ({
  componentInstanceId,
  value,
}: LogicFunctionLogsProps) => {
  const { t } = useLingui();

  const { height, handleResizeStart } = useResizableEditor({
    initialHeight: 150,
    componentInstanceId,
  });

  return (
    <>
      <InputLabel>{t`Logs`}</InputLabel>
      <TextArea
        textAreaId={`logs-${componentInstanceId}`}
        value={value}
        height={height}
        disabled
        readOnly
      />
      <ResizeHandle onPointerDown={handleResizeStart} />
    </>
  );
};

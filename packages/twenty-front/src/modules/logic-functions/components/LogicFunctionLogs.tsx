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

  const { height, handleResizeStart, handleResizeMove, handleResizeEnd } =
    useResizableEditor({
      initialHeight: 150,
    });

  return (
    <>
      <TextArea
        textAreaId={`logs-${componentInstanceId}`}
        label={t`Logs`}
        value={value}
        height={height}
        readOnly
      />
      <ResizeHandle
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
    </>
  );
};

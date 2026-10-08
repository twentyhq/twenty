import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { ResizeHandle } from 'twenty-ui/primitives/layout';
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

  const [height, setHeight] = useState(150);
  const logsContainerId = useId();

  return (
    <>
      <div id={logsContainerId}>
        <TextArea
          textAreaId={`logs-${componentInstanceId}`}
          label={t`Logs`}
          value={value}
          height={height}
          maxRows={5}
          readOnly
        />
      </div>
      <ResizeHandle
        aria-label={t`Resize logs`}
        aria-controls={logsContainerId}
        value={height}
        onValueChange={setHeight}
      />
    </>
  );
};

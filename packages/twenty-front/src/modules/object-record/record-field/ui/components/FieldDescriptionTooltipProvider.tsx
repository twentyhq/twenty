import { FieldDescriptionTooltipContext } from '@/object-record/record-field/ui/contexts/FieldDescriptionTooltipContext';
import { type ReactNode, useId, useMemo, useState } from 'react';
import {
  AppTooltip,
  type AppTooltipProps,
  TooltipDelay,
} from 'twenty-ui/surfaces';

type FieldDescriptionTooltipProviderProps = {
  children: ReactNode;
};

export const FieldDescriptionTooltipProvider = ({
  children,
}: FieldDescriptionTooltipProviderProps) => {
  const tooltipId = useId();
  const [tooltipContent, setTooltipContent] = useState<
    Pick<AppTooltipProps, 'title' | 'description'>
  >({});
  const contextValue = useMemo(
    () => ({ tooltipId, setTooltipContent }),
    [tooltipId],
  );

  return (
    <FieldDescriptionTooltipContext.Provider value={contextValue}>
      {children}
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${tooltipId}']`}
        title={tooltipContent.title}
        description={tooltipContent.description}
        delay={TooltipDelay.longDelay}
        place="bottom"
        positionStrategy="fixed"
      />
    </FieldDescriptionTooltipContext.Provider>
  );
};

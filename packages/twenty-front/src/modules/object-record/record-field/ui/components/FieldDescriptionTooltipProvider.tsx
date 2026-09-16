import { FieldDescriptionTooltipContext } from '@/object-record/record-field/ui/contexts/FieldDescriptionTooltipContext';
import { type FieldDescriptionTooltipContent } from '@/object-record/record-field/ui/types/FieldDescriptionTooltipContent';
import { type ReactNode, useState } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type FieldDescriptionTooltipProviderProps = {
  children: ReactNode;
};

export const FieldDescriptionTooltipProvider = ({
  children,
}: FieldDescriptionTooltipProviderProps) => {
  const [tooltipHandle] = useState(() =>
    Tooltip.createHandle<FieldDescriptionTooltipContent>(),
  );

  return (
    <FieldDescriptionTooltipContext.Provider value={tooltipHandle}>
      <Tooltip.Root handle={tooltipHandle}>
        {({ payload }) => (
          <>
            {children}
            <Tooltip.Popup side="bottom" positionMethod="fixed">
              <Tooltip.Content description={payload?.description}>
                {payload?.title}
              </Tooltip.Content>
            </Tooltip.Popup>
          </>
        )}
      </Tooltip.Root>
    </FieldDescriptionTooltipContext.Provider>
  );
};

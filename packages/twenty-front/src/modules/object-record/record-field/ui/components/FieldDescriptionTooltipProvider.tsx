import { FieldDescriptionTooltipContext } from '@/object-record/record-field/ui/contexts/FieldDescriptionTooltipContext';
import { type FieldDescriptionTooltipContent } from '@/object-record/record-field/ui/types/FieldDescriptionTooltipContent';
import { type ReactNode, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type FieldDescriptionTooltipProviderProps = {
  children: ReactNode;
};

export const FieldDescriptionTooltipProvider = ({
  children,
}: FieldDescriptionTooltipProviderProps) => {
  const activeTriggerRef = useRef<Element>(null);
  const [tooltipHandle] = useState(() =>
    Tooltip.createHandle<FieldDescriptionTooltipContent>(),
  );

  return (
    <FieldDescriptionTooltipContext.Provider value={tooltipHandle}>
      <Tooltip.Root
        handle={tooltipHandle}
        onOpenChange={(...openChangeArguments) => {
          const [open, eventDetails] = openChangeArguments;
          if (open) {
            activeTriggerRef.current = eventDetails.trigger ?? null;

            return;
          }

          const activeTrigger = activeTriggerRef.current;
          const shouldKeepTooltipOpen =
            eventDetails.reason === 'trigger-hover' &&
            isDefined(activeTrigger) &&
            activeTrigger.ownerDocument.activeElement === activeTrigger;

          if (shouldKeepTooltipOpen) {
            eventDetails.cancel();

            return;
          }

          activeTriggerRef.current = null;
        }}
      >
        {({ payload }) => (
          <>
            {children}
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="bottom"
                positionMethod="fixed"
                sideOffset={10}
              >
                <Tooltip.Popup>
                  <Tooltip.Body description={payload?.description}>
                    {payload?.title}
                  </Tooltip.Body>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </>
        )}
      </Tooltip.Root>
    </FieldDescriptionTooltipContext.Provider>
  );
};

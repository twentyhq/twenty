import { SelectOptionDescriptionTooltipContext } from '@/ui/input/contexts/SelectOptionDescriptionTooltipContext';
import { type ReactNode, useState } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SelectOptionDescriptionTooltipProviderProps = {
  children: ReactNode;
};

export const SelectOptionDescriptionTooltipProvider = ({
  children,
}: SelectOptionDescriptionTooltipProviderProps) => {
  const [tooltipHandle] = useState(() => Tooltip.createHandle<string>());

  return (
    <SelectOptionDescriptionTooltipContext.Provider value={tooltipHandle}>
      <Tooltip.Root handle={tooltipHandle}>
        {({ payload }) => (
          <>
            {children}
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="right"
                positionMethod="fixed"
                sideOffset={10}
              >
                <Tooltip.Popup>
                  <Tooltip.Body>{payload}</Tooltip.Body>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </>
        )}
      </Tooltip.Root>
    </SelectOptionDescriptionTooltipContext.Provider>
  );
};

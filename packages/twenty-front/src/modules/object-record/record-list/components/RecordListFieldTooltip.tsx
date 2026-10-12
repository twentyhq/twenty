import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TooltipTextContent } from '@/ui/layout/tooltip/components/TooltipTextContent';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type RecordListFieldTooltipProps = {
  children: ReactNode;
};

export const RecordListFieldTooltip = ({
  children,
}: RecordListFieldTooltipProps) => {
  const { getIcon } = useIcons();
  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  return (
    <Tooltip.Root<string>>
      {({ payload }) => {
        const fieldDefinition = isDefined(payload)
          ? fieldDefinitionByFieldMetadataItemId[payload]
          : undefined;
        const FieldIcon = isDefined(fieldDefinition)
          ? getIcon(fieldDefinition.iconName)
          : undefined;

        return (
          <>
            {children}
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="bottom"
                positionMethod="fixed"
                sideOffset={10}
                style={{ maxWidth: '300px' }}
              >
                <Tooltip.Popup>
                  <TooltipTextContent
                    startIcon={isDefined(FieldIcon) ? <FieldIcon /> : undefined}
                  >
                    {fieldDefinition?.label}
                  </TooltipTextContent>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </>
        );
      }}
    </Tooltip.Root>
  );
};

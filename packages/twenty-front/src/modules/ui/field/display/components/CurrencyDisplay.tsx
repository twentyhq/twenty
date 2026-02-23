import { useTheme } from '@emotion/react';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { isDefined, formatToShortNumber } from 'twenty-shared/utils';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
  fieldDefinition: FieldDefinition<FieldCurrencyMetadata>;
};

export const CurrencyDisplay = ({
  currencyValue,
  fieldDefinition,
}: CurrencyDisplayProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const [shouldRenderTooltip, setShouldRenderTooltip] = useState(false);

  const currencyCode = currencyValue?.currencyCode;
  const currencyMetadata = isDefined(currencyCode)
    ? SETTINGS_FIELD_CURRENCY_CODES[currencyCode]
    : null;
  const CurrencyIcon = currencyMetadata?.Icon ?? null;

  const amountToDisplay = isUndefinedOrNull(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros / 1000000;

  const format = fieldDefinition.metadata.settings?.format;
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const decimalsToUse = decimals ?? DEFAULT_DECIMAL_VALUE;

  const { formatNumber } = useNumberFormat();
  const tooltipAnchorId = `currency-icon-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;
  const currencyTooltipContent = isDefined(currencyCode)
    ? `${currencyCode}${currencyMetadata?.label ? ` - ${currencyMetadata.label}` : ''}`
    : undefined;
  const shouldShowCurrencyTooltip =
    isDefined(CurrencyIcon) &&
    amountToDisplay !== null &&
    isDefined(currencyTooltipContent);

  return (
    <>
      <EllipsisDisplay>
        {shouldShowCurrencyTooltip && (
          <>
            <span
              id={tooltipAnchorId}
              onMouseEnter={() => setShouldRenderTooltip(true)}
              onMouseLeave={() => setShouldRenderTooltip(false)}
            >
              <CurrencyIcon
                color={theme.font.color.primary}
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </span>{' '}
          </>
        )}
        {amountToDisplay !== null
          ? !isDefined(format) || format === 'short'
            ? formatToShortNumber(amountToDisplay)
            : formatNumber(amountToDisplay, { decimals: decimalsToUse })
          : null}
      </EllipsisDisplay>
      {shouldRenderTooltip &&
        shouldShowCurrencyTooltip &&
        createPortal(
          <AppTooltip
            anchorSelect={`#${tooltipAnchorId}`}
            content={currencyTooltipContent}
            delay={TooltipDelay.shortDelay}
            place={TooltipPosition.Top}
            positionStrategy="fixed"
          />,
          document.body,
        )}
    </>
  );
};

import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { getCurrencyPrefix } from '@/localization/utils/getCurrencyPrefix';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { DEFAULT_DECIMAL_VALUE } from '@/localization/utils/formatNumber';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
  fieldDefinition: FieldDefinition<FieldCurrencyMetadata>;
};

export const CurrencyDisplay = ({
  currencyValue,
  fieldDefinition,
}: CurrencyDisplayProps) => {
  const { i18n } = useLingui();

  const currencyCode = currencyValue?.currencyCode;
  const currencyPrefix = isDefined(currencyCode)
    ? getCurrencyPrefix(currencyCode)
    : undefined;
  const amountToDisplay = !isDefined(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros / 1000000;

  const format = fieldDefinition.metadata.settings?.format;
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const decimalsToUse = decimals ?? DEFAULT_DECIMAL_VALUE;

  const { formatNumber } = useNumberFormat();
  const currencyLabel = isDefined(currencyCode)
    ? getCurrencyLabel({ currencyCode, locale: i18n.locale })
    : undefined;
  const currencyTooltipContent = isDefined(currencyCode)
    ? `${currencyCode}${isDefined(currencyLabel) ? ` - ${currencyLabel}` : ''}`
    : undefined;
  const shouldShowCurrencyTooltip =
    isNonEmptyString(currencyPrefix) &&
    amountToDisplay !== null &&
    isDefined(currencyTooltipContent);

  return (
    <EllipsisDisplay>
      {shouldShowCurrencyTooltip && (
        <Tooltip
          content={currencyTooltipContent}
          delay={TooltipDelay.shortDelay}
          side="top"
          positionMethod="fixed"
        >
          <span>{currencyPrefix}</span>
        </Tooltip>
      )}
      {amountToDisplay !== null
        ? !isDefined(format) || format === 'short'
          ? formatToShortNumber(amountToDisplay)
          : formatNumber(amountToDisplay, { decimals: decimalsToUse })
        : null}
    </EllipsisDisplay>
  );
};

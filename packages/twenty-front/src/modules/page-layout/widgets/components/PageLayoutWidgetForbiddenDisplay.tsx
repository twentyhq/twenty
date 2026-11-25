import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useLingui } from '@lingui/react/macro';

type PageLayoutWidgetForbiddenDisplayProps = {
  widgetId: string;
  restriction: WidgetAccessDenialInfo;
};

export const PageLayoutWidgetForbiddenDisplay = ({
  widgetId,
  restriction,
}: PageLayoutWidgetForbiddenDisplayProps) => {
  const { t } = useLingui();
  const tooltipId = `widget-forbidden-tooltip-${widgetId}`;

  const getTooltipContent = () => {
    if (restriction.type === 'object' && isDefined(restriction.objectName)) {
      const objectName = restriction.objectName;
      return t`You do not have permission to access the ${objectName} object`;
    }

    if (
      restriction.type === 'field' &&
      isDefined(restriction.fieldNames) &&
      restriction.fieldNames.length > 0
    ) {
      const fieldsList = restriction.fieldNames.join(', ');
      return plural(restriction.fieldNames.length, {
        one: `You do not have permission to access the ${fieldsList} field`,
        other: `You do not have permission to access the ${fieldsList} fields`,
      });
    }

    return t`You do not have permission to view this widget`;
  };

  return (
    <Tooltip
      delay={TooltipDelay.mediumDelay}
      content={getTooltipContent()}
      side="top"
    >
      <div id={tooltipId}>
        <ForbiddenFieldDisplay />
      </div>
    </Tooltip>
  );
};

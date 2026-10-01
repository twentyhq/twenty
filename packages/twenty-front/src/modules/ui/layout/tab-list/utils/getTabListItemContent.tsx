import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, Pill } from 'twenty-ui/primitives/data-display';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

export const getTabListItemContent = ({
  Icon,
  logo,
  title,
  pill,
}: SingleTabProps) => ({
  startIcon:
    isDefined(Icon) || isNonEmptyString(logo) ? (
      <>
        {isDefined(Icon) && <Icon />}
        {isNonEmptyString(logo) && (
          <Avatar src={logo} size="md" name={title} aria-hidden />
        )}
      </>
    ) : undefined,
  badge: isString(pill) ? <Pill label={pill} /> : pill,
});

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SETTINGS_SECTION_ANCHOR_DATA_ATTRIBUTE } from '@/settings/constants/SettingsSectionAnchorDataAttribute';
import { watchSettingsSectionAnchorScroll } from '@/settings/utils/watchSettingsSectionAnchorScroll';
import { parseTabRouteHash } from '@/ui/layout/tab-list/utils/parseTabRouteHash';

type SettingsSectionAnchorScrollEffectProps = {
  sectionId: string;
};

export const SettingsSectionAnchorScrollEffect = ({
  sectionId,
}: SettingsSectionAnchorScrollEffectProps) => {
  const { hash, key: locationKey } = useLocation();

  const isTargeted = parseTabRouteHash(hash).sectionId === sectionId;

  useEffect(() => {
    if (!isTargeted) {
      return;
    }

    const anchorElement = document.querySelector<HTMLElement>(
      `[${SETTINGS_SECTION_ANCHOR_DATA_ATTRIBUTE}="${sectionId}"]`,
    );

    if (!isDefined(anchorElement)) {
      return;
    }

    return watchSettingsSectionAnchorScroll(anchorElement);
  }, [isTargeted, locationKey, sectionId]);

  return null;
};

import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { hideSettingsBanner } from '../functions/hideSettingsBanner';
import { showSettingsBanner } from '../functions/showSettingsBanner';
import { type ShowSettingsBannerParams } from '../globals/frontComponentHostCommunicationApi';

export const useSettingsBanner = (
  banner: ShowSettingsBannerParams | null,
): void => {
  const variant = banner?.variant;
  const text = banner?.text;
  const actionLabel = banner?.action?.label;
  const onClick = banner?.action?.onClick;

  // oxlint-disable-next-line twenty/no-state-useref
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!isDefined(text)) {
      hideSettingsBanner();

      return;
    }

    showSettingsBanner({
      variant,
      text,
      action: isDefined(actionLabel)
        ? { label: actionLabel, onClick: () => onClickRef.current?.() }
        : undefined,
    });
  }, [variant, text, actionLabel]);

  useEffect(() => {
    return () => {
      hideSettingsBanner();
    };
  }, []);
};

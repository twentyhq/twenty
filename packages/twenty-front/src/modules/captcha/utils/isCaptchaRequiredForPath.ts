import { matchPath } from 'react-router-dom';
import { PATHS_REQUIRING_CAPTCHA } from '../constants/captchaPaths';

export const isCurrentPathRequiringCaptcha = (): boolean => {
  const { pathname } = window.location;

  return PATHS_REQUIRING_CAPTCHA.some((path) =>
    matchPath(
      {
        path,
        end: false, // Match nested routes too
      },
      pathname,
    ),
  );
};

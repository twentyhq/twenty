import { matchPath } from 'react-router-dom';
import { PATHS_REQUIRING_CAPTCHA } from '../constants/PathsRequiringCaptcha';

export const isCaptchaRequiredForPath = (pathname: string): boolean =>
  PATHS_REQUIRING_CAPTCHA.some((path) =>
    matchPath(
      {
        path,
        end: false, // Match nested routes too
      },
      pathname,
    ),
  );

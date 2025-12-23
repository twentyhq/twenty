import { matchPath } from 'react-router-dom';
import { CAPTCHA_PROTECTED_PATHS } from '@/modules/captcha/constants/CaptchaProtectedPaths';

export const isCaptchaRequiredForPath = (pathname: string): boolean =>
  CAPTCHA_PROTECTED_PATHS.some((path) =>
    matchPath(
      {
        path,
        end: false, // Match nested routes too
      },
      pathname,
    ),
  );

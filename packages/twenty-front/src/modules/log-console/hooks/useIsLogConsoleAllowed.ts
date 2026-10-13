import { useIsMobile } from 'twenty-ui/utilities';

export const useIsLogConsoleAllowed = () => !useIsMobile();

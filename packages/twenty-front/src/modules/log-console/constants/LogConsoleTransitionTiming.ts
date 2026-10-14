import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_ANIMATION_EASING } from '@/log-console/constants/LogConsoleAnimationEasing';

export const LOG_CONSOLE_TRANSITION_TIMING = `calc(${themeCssVariables.animation.duration.normal} * 1s) ${LOG_CONSOLE_ANIMATION_EASING}`;

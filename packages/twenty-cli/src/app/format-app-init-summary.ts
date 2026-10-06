import { type AppInitNextStep } from '@/app/types/app-init-next-step.type';
import { formatList } from '@/output/format-list';
import {
  boldText,
  colorText,
  dimText,
  formatSuccessLine,
} from '@/output/style';

export const formatAppInitSummary = ({
  appName,
  location,
  packageNames,
  packageVersion,
  nextSteps,
}: {
  appName: string;
  location: string;
  packageNames: string[];
  packageVersion: string;
  nextSteps: AppInitNextStep[];
}) => {
  const commandWidth = Math.max(
    ...nextSteps.map(({ command }) => command.length),
  );

  return [
    formatSuccessLine(`Created ${appName} in ${location}`),
    dimText(
      `  ${formatList(packageNames)} pinned to ${packageVersion}. Nothing was installed.`,
    ),
    '',
    boldText('Next steps'),
    ...nextSteps.map(
      ({ command, description }) =>
        `  ${colorText('cyan', command.padEnd(commandWidth))}  ${dimText(`# ${description}`)}`,
    ),
  ].join('\n');
};

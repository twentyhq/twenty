import { type AppInitNextStep } from '@/app/types/app-init-next-step.type';
import { formatList } from '@/output/format-list';
import { dimText, formatSuccessLine } from '@/output/style';

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
    'Next steps',
    ...nextSteps.map(
      ({ command, description }) =>
        `  ${command.padEnd(commandWidth)}  ${dimText(`# ${description}`)}`,
    ),
  ].join('\n');
};

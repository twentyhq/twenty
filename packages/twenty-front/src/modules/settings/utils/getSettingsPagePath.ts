import { ExtractPathParams } from '@/types/ExtractPathParams';
import { SettingsPath } from '@/types/SettingsPath';
import { isDefined } from '~/utils/isDefined';

type Params<V extends string> = {
  [K in ExtractPathParams<V>]: string;
} & {
  id?: string;
};

export const getSettingsPagePath = <Path extends SettingsPath>(
  path: Path,
  params?: Params<Path>,
) => {
  let resultPath = `/settings/${path}`;

  if (isDefined(params)) {
    resultPath = resultPath.replace(/:([a-zA-Z]+)/g, (_, key) => {
      const value = params[key as keyof Params<Path>];

      return value;
    });
  }

  if (isDefined(params?.id)) {
    resultPath = `${resultPath}/${params?.id}`;
  }

  return resultPath;
};

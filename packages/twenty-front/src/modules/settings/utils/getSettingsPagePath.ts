import { SettingsPath } from '@/types/SettingsPath';
import { isDefined } from '~/utils/isDefined';

type PathParams = {
  id?: string;
  objectSlug?: string;
};

export const getSettingsPagePath = <Path extends SettingsPath>(
  path: Path,
  params?: PathParams,
) => {
  let resultPath = `/settings/${path}`;

  if (isDefined(params?.objectSlug)) {
    resultPath = resultPath.replace(':objectSlug', params.objectSlug);
  }

  if (isDefined(params?.id)) {
    resultPath = `${resultPath}/${params?.id}`;
  }

  return resultPath;
};

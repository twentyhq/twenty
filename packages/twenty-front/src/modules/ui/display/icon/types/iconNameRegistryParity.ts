import { type IconName } from 'twenty-shared/types';
import { type ResolvableIconName } from 'twenty-ui/icon';

// IconName is generated from ALL_ICONS for packages that cannot import
// twenty-ui, so it goes stale unless regeneration is enforced somewhere both
// packages are visible.
type GeneratedButNotResolvable = Exclude<IconName, ResolvableIconName>;
type ResolvableButNotGenerated = Exclude<ResolvableIconName, IconName>;

type AssertNever<T extends never> = T;

export type IconNameMatchesRegistry = [
  AssertNever<GeneratedButNotResolvable>,
  AssertNever<ResolvableButNotGenerated>,
];

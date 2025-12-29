// IA Generated
import { type Sources } from 'twenty-shared/types';

type FlatSource = { path: string; content: string };

export const flattenSources = (
  sources: Sources,
  basePath = '',
): FlatSource[] => {
  const out: FlatSource[] = [];

  const join = (a: string, b: string) => (a ? `${a}/${b}` : b);

  const walk = (node: Sources, prefix: string) => {
    for (const [name, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        out.push({ path: join(prefix, name), content: value });
      } else if (value && typeof value === 'object') {
        walk(value as Sources, join(prefix, name));
      }
    }
  };

  walk(sources, basePath);

  out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return out;
};

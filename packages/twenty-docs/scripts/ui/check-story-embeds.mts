import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import { isNonEmptyString } from '@sniptt/guards';
import { visit } from 'unist-util-visit';

export const checkStoryEmbeds = ({
  content,
  storyIds,
  storiesWithPlayFunctions = new Set<string>(),
  displayStoryIds = new Set<string>(),
  requireDisplay = false,
  getPresentationErrors = () => [],
}: {
  content: string;
  storyIds: Set<string>;
  storiesWithPlayFunctions?: Set<string>;
  displayStoryIds?: Set<string>;
  requireDisplay?: boolean;
  getPresentationErrors?: (storyId: string) => string[];
}): string[] => {
  const errors: string[] = [];
  const tree = createProcessor({
    remarkPlugins: [remarkFrontmatter],
  }).parse(content);
  const embedNames = new Set(['StoryEmbed']);
  let hasPreview = false;

  visit(tree, 'mdxjsEsm', (node) => {
    for (const statement of node.data?.estree?.body ?? []) {
      if (
        statement.type !== 'ImportDeclaration' ||
        statement.source.value !== '/snippets/ui/StoryEmbed.mdx'
      ) {
        continue;
      }

      for (const specifier of statement.specifiers) {
        const isNamedEmbed =
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'StoryEmbed';

        if (specifier.type === 'ImportDefaultSpecifier' || isNamedEmbed) {
          embedNames.add(specifier.local.name);
        }
      }
    }
  });

  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
    if (
      (node.type !== 'mdxJsxFlowElement' &&
        node.type !== 'mdxJsxTextElement') ||
      !embedNames.has(node.name ?? '')
    ) {
      return;
    }

    const storyId = node.attributes.find(
      (attribute) =>
        attribute.type === 'mdxJsxAttribute' && attribute.name === 'storyId',
    );
    const value =
      storyId?.type === 'mdxJsxAttribute' ? storyId.value : undefined;
    const line = node.position?.start.line;
    const isFirstPreview = !hasPreview;

    hasPreview = true;

    const hasSpreadAttributes = node.attributes.some(
      (attribute) => attribute.type === 'mdxJsxExpressionAttribute',
    );

    if (!isNonEmptyString(value) || hasSpreadAttributes) {
      errors.push(`Line ${line}: StoryEmbed needs a literal storyId.`);
      return;
    }

    if (!storyIds.has(value)) {
      errors.push(`Line ${line}: Storybook story "${value}" does not exist.`);
      return;
    }

    if (requireDisplay && isFirstPreview && !displayStoryIds.has(value)) {
      errors.push(
        `Line ${line}: The first component preview must use a story exported as Display.`,
      );
    }

    const title = node.attributes.find(
      (attribute) =>
        attribute.type === 'mdxJsxAttribute' && attribute.name === 'title',
    );
    const titleValue =
      title?.type === 'mdxJsxAttribute' ? title.value : undefined;

    if (!isNonEmptyString(titleValue) || !isNonEmptyString(titleValue.trim())) {
      errors.push(
        `Line ${line}: StoryEmbed needs a descriptive literal title.`,
      );
    }

    if (storiesWithPlayFunctions.has(value)) {
      errors.push(
        `Line ${line}: Storybook story "${value}" has a play function. Documentation stories must be presentational.`,
      );
      return;
    }

    for (const error of getPresentationErrors(value)) {
      errors.push(`Line ${line}: Storybook story "${value}": ${error}`);
    }
  });

  if (requireDisplay && !hasPreview) {
    errors.push('Component guides must include a Display story preview.');
  }

  return errors;
};

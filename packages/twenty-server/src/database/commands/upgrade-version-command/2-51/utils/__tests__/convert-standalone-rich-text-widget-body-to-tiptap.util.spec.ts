import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { convertStandaloneRichTextWidgetBodyToTiptap } from 'src/database/commands/upgrade-version-command/2-51/utils/convert-standalone-rich-text-widget-body-to-tiptap.util';

const richTextConfiguration = (body: unknown) => ({
  configurationType: 'STANDALONE_RICH_TEXT',
  body,
});

const convertWidgetBody = (configuration: unknown) =>
  convertStandaloneRichTextWidgetBodyToTiptap({
    configuration,
    objectNameSingularByObjectMetadataId: new Map(),
  });

const helloDocument = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

const helloBlockNote = JSON.stringify([
  {
    id: 'block-1',
    type: 'paragraph',
    props: {},
    content: [{ type: 'text', text: 'Hello', styles: {} }],
    children: [],
  },
]);

describe('convertStandaloneRichTextWidgetBodyToTiptap', () => {
  it('should add a TipTap document converted from the BlockNote blocks', () => {
    expect(
      convertWidgetBody(
        richTextConfiguration({ blocknote: helloBlockNote, markdown: 'Hello' }),
      ),
    ).toEqual({
      value: richTextConfiguration({
        blocknote: helloBlockNote,
        markdown: 'Hello',
        tiptap: helloDocument,
      }),
      hasChanged: true,
    });
  });

  it('should derive the markdown from the TipTap document when the body has none', () => {
    expect(
      convertWidgetBody(
        richTextConfiguration({ blocknote: helloBlockNote, markdown: null }),
      ),
    ).toEqual({
      value: richTextConfiguration({
        blocknote: helloBlockNote,
        markdown: 'Hello',
        tiptap: helloDocument,
      }),
      hasChanged: true,
    });
  });

  it('should build the TipTap document from markdown when there are no BlockNote blocks', () => {
    expect(
      convertWidgetBody(richTextConfiguration({ markdown: 'Hello' })),
    ).toEqual({
      value: richTextConfiguration({
        markdown: 'Hello',
        tiptap: helloDocument,
      }),
      hasChanged: true,
    });
  });

  it('should leave converted and empty bodies untouched', () => {
    for (const configuration of [
      richTextConfiguration({ markdown: null, tiptap: helloDocument }),
      richTextConfiguration({ blocknote: null, markdown: null }),
    ]) {
      expect(convertWidgetBody(configuration)).toEqual({
        value: configuration,
        hasChanged: false,
      });
    }
  });
});

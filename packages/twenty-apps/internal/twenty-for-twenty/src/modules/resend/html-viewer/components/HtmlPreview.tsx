import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type HtmlPreviewProps = {
  html: string | null | undefined;
};

export const HtmlPreview = ({ html }: HtmlPreviewProps) => {
  if (!isDefined(html) || !isNonEmptyString(html)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontFamily: 'sans-serif',
          fontSize: '14px',
        }}
      >
        No HTML content available
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      sandbox=""
      title="Email HTML preview"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
};

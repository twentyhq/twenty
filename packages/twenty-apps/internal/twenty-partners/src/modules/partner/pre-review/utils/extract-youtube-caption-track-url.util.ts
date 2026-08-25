// The watch page embeds the player config as JSON inside a <script>; the first
// captionTracks entry is the default language track.
export const extractYoutubeCaptionTrackUrl = (
  html: string | null,
): string | null => {
  if (html === null) return null;

  const match = /"captionTracks":\[\{"baseUrl":"(.*?)"/.exec(html);
  if (match?.[1] === undefined) return null;

  const url = match[1]
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"');

  return url.startsWith('http') ? url : null;
};

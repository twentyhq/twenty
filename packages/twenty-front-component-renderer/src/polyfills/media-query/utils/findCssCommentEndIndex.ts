const COMMENT_START = '/*';

const COMMENT_END = '*/';

type FindCssCommentEndIndexInput = {
  cssText: string;
  commentStartIndex: number;
};

export const findCssCommentEndIndex = ({
  cssText,
  commentStartIndex,
}: FindCssCommentEndIndexInput): number => {
  const commentEndMarkerIndex = cssText.indexOf(
    COMMENT_END,
    commentStartIndex + COMMENT_START.length,
  );
  const isUnterminatedComment = commentEndMarkerIndex === -1;

  return isUnterminatedComment
    ? cssText.length
    : commentEndMarkerIndex + COMMENT_END.length;
};

export const writeLine = ({
  stream,
  text,
}: {
  stream: NodeJS.WriteStream;
  text: string;
}) => {
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
};

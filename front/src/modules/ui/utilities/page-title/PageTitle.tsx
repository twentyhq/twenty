import { Helmet } from 'react-helmet-async';

type PageTitleProps = {
  title: string;
};

export const PageTitle = (props: PageTitleProps) => {
  return (
    <Helmet>
      <title>{props.title}</title>
    </Helmet>
  );
};

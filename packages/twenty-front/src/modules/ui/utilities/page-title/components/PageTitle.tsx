import { Helmet } from '@dr.pogodin/react-helmet';

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

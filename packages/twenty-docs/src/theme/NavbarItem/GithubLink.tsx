import React from 'react';
import { TbBrandGithub } from 'react-icons/tb';

const GithubLink = () => {
  return (
    <a
      className="navbar__item navbar__link"
      href="https://github.com/twentyhq/twenty"
      target="_blank"
      rel="noreferrer noopener"
      style={{
        display: 'flex',
        verticalAlign: 'middle',
      }}
    >
      <TbBrandGithub />
    </a>
  );
};

export default GithubLink;
